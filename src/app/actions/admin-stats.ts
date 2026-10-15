"use server";

import { and, count, countDistinct, desc, eq, ne, sql, sum } from "drizzle-orm";
import {
  getAdultCompanionCount,
  getRegularRegistrationCount,
} from "@/app/actions/ocr";
import { db } from "@/db";
import { payments, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { ADULT_COMPANION_LIMIT, REGULAR_LIMIT } from "@/lib/capacity";
import { getRequiredAmount } from "@/lib/registration-status";

const TZ = "America/Mexico_City";
const DAYS = 30;

export type AdminStats = {
  totalUsers: number;
  validatedPayments: number; // asistentes con al menos un pago validado
  pendingPayments: number; // pagos en revisión
  totalIncome: number;
  usersByStatus: { pendiente: number; parcial: number; completado: number };
  capacity: {
    regular: { used: number; limit: number };
    adults: { used: number; limit: number };
  };
  finance: {
    validated: number;
    inReview: number;
    receivable: number;
    byMethod: { tarjeta: number; transferencia: number; efectivo: number };
  };
  registrationsByDay: { date: string; count: number }[]; // más antiguo primero
  topLocalities: { locality: string; count: number }[];
};

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  validatedPayments: 0,
  pendingPayments: 0,
  totalIncome: 0,
  usersByStatus: { pendiente: 0, parcial: 0, completado: 0 },
  capacity: {
    regular: { used: 0, limit: REGULAR_LIMIT },
    adults: { used: 0, limit: ADULT_COMPANION_LIMIT },
  },
  finance: {
    validated: 0,
    inReview: 0,
    receivable: 0,
    byMethod: { tarjeta: 0, transferencia: 0, efectivo: 0 },
  },
  registrationsByDay: [],
  topLocalities: [],
};

// Últimos `DAYS` días (hoy incluido) como YYYY-MM-DD en hora de México.
function lastDays() {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });
  const out: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    out.push(fmt.format(new Date(Date.now() - i * 86_400_000)));
  }
  return out;
}

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();
  try {
    const attendee = eq(users.role, "user");

    // ponytail: ~7 consultas agregadas en paralelo; suficiente para ≤ ~600 asistentes
    const paidSub = db
      .select({
        userId: payments.userId,
        paid: sum(payments.amount).as("paid"),
      })
      .from(payments)
      .where(eq(payments.status, "completado"))
      .groupBy(payments.userId)
      .as("paid_sub");
    const dayExpr = sql<string>`to_char((${users.createdAt} AT TIME ZONE 'UTC') AT TIME ZONE '${sql.raw(TZ)}', 'YYYY-MM-DD')`;
    const required = await getRequiredAmount();

    const [
      [totalUsers],
      byStatus,
      [validatedUsers],
      byPayment,
      [receivable],
      byDay,
      topLocalities,
      adultCount,
      regularCount,
    ] = await Promise.all([
      db.select({ value: count() }).from(users).where(attendee),
      db
        .select({ status: users.registrationStatus, value: count() })
        .from(users)
        .where(attendee)
        .groupBy(users.registrationStatus),
      db
        .select({ value: countDistinct(payments.userId) })
        .from(payments)
        .innerJoin(users, eq(payments.userId, users.id))
        .where(and(eq(payments.status, "completado"), attendee)),
      db
        .select({
          status: payments.status,
          method: payments.method,
          total: sum(payments.amount),
          rows: count(),
        })
        .from(payments)
        .innerJoin(users, eq(payments.userId, users.id))
        .where(attendee)
        .groupBy(payments.status, payments.method),
      db
        .select({
          value: sql<string>`COALESCE(SUM(GREATEST(${required} - COALESCE(${paidSub.paid}, 0), 0)), 0)`,
        })
        .from(users)
        .leftJoin(paidSub, eq(paidSub.userId, users.id))
        .where(and(attendee, ne(users.registrationStatus, "completado"))),
      db
        .select({ day: dayExpr, value: count() })
        .from(users)
        .where(
          and(
            attendee,
            sql`${users.createdAt} >= now() - interval '${sql.raw(String(DAYS + 1))} days'`,
          ),
        )
        .groupBy(dayExpr),
      db
        .select({ locality: users.locality, value: count() })
        .from(users)
        .where(attendee)
        .groupBy(users.locality)
        .orderBy(desc(count()), users.locality)
        .limit(5),
      getAdultCompanionCount(),
      getRegularRegistrationCount(),
    ]);

    const usersByStatus = { pendiente: 0, parcial: 0, completado: 0 };
    for (const r of byStatus) usersByStatus[r.status] = r.value;

    const byMethod = { tarjeta: 0, transferencia: 0, efectivo: 0 };
    let validated = 0;
    let inReview = 0;
    let pendingPayments = 0;
    for (const r of byPayment) {
      const total = Number(r.total ?? 0);
      if (r.status === "completado") {
        validated += total;
        byMethod[r.method] += total;
      } else if (r.status === "revision") {
        inReview += total;
        pendingPayments += r.rows;
      }
    }

    const dayCounts = new Map(byDay.map((r) => [r.day, r.value]));

    return {
      totalUsers: totalUsers.value,
      validatedPayments: validatedUsers.value,
      pendingPayments,
      totalIncome: validated,
      usersByStatus,
      capacity: {
        regular: { used: regularCount, limit: REGULAR_LIMIT },
        adults: { used: adultCount, limit: ADULT_COMPANION_LIMIT },
      },
      finance: {
        validated,
        inReview,
        receivable: Number(receivable.value),
        byMethod,
      },
      registrationsByDay: lastDays().map((date) => ({
        date,
        count: dayCounts.get(date) ?? 0,
      })),
      topLocalities: topLocalities.map((r) => ({
        locality: r.locality,
        count: r.value,
      })),
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return EMPTY_STATS;
  }
}
