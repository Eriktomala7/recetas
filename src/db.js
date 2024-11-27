import {createPool} from "mysql2/promise";
import{BD_HOST, BD_DATABASE, BD_USER, BD_PASS, BD_PORT,} from "./config.js";
export const conmysql = createPool({
    host:BD_HOST,
    database:BD_DATABASE,
    user:BD_USER,
    password:BD_PASS,
    port:BD_PORT
});