"use server";

import { ScenarioValues } from "@/components/renderer/types";
import { getMe } from "@/lib/api/me";
import { createScenarioDesign } from "@/lib/api/scenario-design";
import { getSession } from "@/lib/auth";

export async function createScenarioAction(values: ScenarioValues) {
  const session = await getSession();
  console.log(session)
  if (!session) {
    throw new Error("Unauthorized");
  }

  await getMe();
  await createScenarioDesign(values)
}