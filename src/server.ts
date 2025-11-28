import express from "express";
import dotenv from "dotenv";
import { initiateApp } from "./utils/initiateApp";

dotenv.config();

const app = express();

initiateApp(app);


