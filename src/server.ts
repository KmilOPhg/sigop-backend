import colors from "colors";
import { prisma } from "../lib/prisma.js";

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log(colors.bgGreen.bold("Conexión exitosa a PostgreSQL (Prisma)"));
    } catch (err) {
        console.error(err);
        console.log(colors.red.bold("Error al conectar a la base de datos"));
    }
}
