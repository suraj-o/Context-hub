import { prisma } from "../repository/prisma.js";
import { logger } from "../core/logger.js";
import type { ManageWorkspaceInput } from "../domain/types.js";
import { NotFoundError, ValidationError } from "../domain/errors.js";

// ── Workspace Service ──────────────────────────────────────

/**
 * Manages the User → Workspaces hierarchy.
 * Provides CRUD operations for workspace-level isolation.
 */

/**
 * Dispatch workspace management actions.
 */
export async function manageWorkspace(
  input: ManageWorkspaceInput
): Promise<Record<string, unknown>> {
  switch (input.action) {
    case "create":
      return createWorkspace(input);
    case "list":
      return listWorkspaces(input);
    case "update":
      return updateWorkspace(input);
    case "delete":
      return deleteWorkspace(input);
    default:
      throw new ValidationError(`Unknown action: ${input.action}`);
  }
}

// ── Create ─────────────────────────────────────────────────

async function createWorkspace(
  input: ManageWorkspaceInput
): Promise<Record<string, unknown>> {
  if (!input.userId) throw new ValidationError("userId is required to create a workspace");
  if (!input.name) throw new ValidationError("name is required");

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  });

  if (!user) {
    throw new NotFoundError("User", input.userId);
  }

  const workspace = await prisma.workspace.create({
    data: {
      userId: input.userId,
      name: input.name,
    },
  });

  logger.info(`Workspace created: ${workspace.id} (${workspace.name})`);
  return workspace as unknown as Record<string, unknown>;
}

// ── List ───────────────────────────────────────────────────

async function listWorkspaces(
  input: ManageWorkspaceInput
): Promise<Record<string, unknown>> {
  if (!input.userId) throw new ValidationError("userId is required for listing");

  const workspaces = await prisma.workspace.findMany({
    where: { userId: input.userId },
    include: {
      _count: {
        select: { projects: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    workspaces,
    total: workspaces.length,
  };
}

// ── Update ─────────────────────────────────────────────────

async function updateWorkspace(
  input: ManageWorkspaceInput
): Promise<Record<string, unknown>> {
  if (!input.workspaceId) throw new ValidationError("workspaceId is required");
  if (!input.name) throw new ValidationError("name is required for update");

  const existing = await prisma.workspace.findUnique({
    where: { id: input.workspaceId },
  });

  if (!existing) throw new NotFoundError("Workspace", input.workspaceId);

  const updated = await prisma.workspace.update({
    where: { id: input.workspaceId },
    data: { name: input.name },
  });

  logger.info(`Workspace updated: ${updated.id}`);
  return updated as unknown as Record<string, unknown>;
}

// ── Delete ─────────────────────────────────────────────────

async function deleteWorkspace(
  input: ManageWorkspaceInput
): Promise<Record<string, unknown>> {
  if (!input.workspaceId) throw new ValidationError("workspaceId is required");

  const existing = await prisma.workspace.findUnique({
    where: { id: input.workspaceId },
  });

  if (!existing) throw new NotFoundError("Workspace", input.workspaceId);

  // Cascade delete (FK constraints handle child projects and contexts)
  await prisma.workspace.delete({ where: { id: input.workspaceId } });

  logger.info(`Workspace deleted: ${input.workspaceId}`);
  return { id: input.workspaceId, deleted: true };
}
