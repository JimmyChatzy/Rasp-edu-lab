import { promises as fs } from "fs";
import path from "path";
import type { Comment, TeachingScenario, User } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string): Promise<T> {
  const filePath = path.join(DATA_DIR, file);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, file);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getScenarios(): Promise<TeachingScenario[]> {
  return readJson<TeachingScenario[]>("scenarios.json");
}

export async function getScenarioById(id: string): Promise<TeachingScenario | undefined> {
  const scenarios = await getScenarios();
  return scenarios.find((scenario) => scenario.id === id);
}

export async function createScenario(scenario: TeachingScenario): Promise<void> {
  const scenarios = await getScenarios();
  scenarios.unshift(scenario);
  await writeJson("scenarios.json", scenarios);
}

export async function getCommentsByScenarioId(scenarioId: string): Promise<Comment[]> {
  const comments = await readJson<Comment[]>("comments.json");
  return comments
    .filter((comment) => comment.scenarioId === scenarioId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export async function createComment(comment: Comment): Promise<void> {
  const comments = await readJson<Comment[]>("comments.json");
  comments.push(comment);
  await writeJson("comments.json", comments);
}

export async function getUsers(): Promise<User[]> {
  return readJson<User[]>("users.json");
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((user) => user.email === email.toLowerCase());
}

export async function createUser(user: User): Promise<void> {
  const users = await getUsers();
  users.push(user);
  await writeJson("users.json", users);
}

export async function getScenariosByAuthorId(authorId: string): Promise<TeachingScenario[]> {
  const scenarios = await getScenarios();
  return scenarios.filter((scenario) => scenario.authorId === authorId);
}
