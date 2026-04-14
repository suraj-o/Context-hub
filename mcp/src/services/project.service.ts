import { prisma } from "../repository/prisma.js";
import { logger } from "../core/logger.js";
import type { ManageProjectInput } from "../domain/types.js";
import { NotFoundError, ValidationError } from "../domain/errors.js";

// ── Project Service ────────────────────────────────────────

/**
 * Manages the Users → Workspaces → Projects hierarchy.
 * Provides CRUD operations for project-level isolation.
 */

/**
 * Dispatch project management actions.
 */
export async function manageProject(
  input: ManageProjectInput
): Promise<Record<string, unknown>> {
  switch (input.action) {
    case "create":
      return createProject(input);
    case "list":
      return listProjects(input);
    case "update":
      return updateProject(input);
    case "delete":
      return deleteProject(input);
    default:
      throw new ValidationError(`Unknown action: ${input.action}`);
  }
}

// ── Create ─────────────────────────────────────────────────

async function createProject(
  input: ManageProjectInput
): Promise<Record<string, unknown>> {
  if (!input.workspaceId) throw new ValidationError("workspaceId is required");
  if (!input.name) throw new ValidationError("name is required");

  // Ensure workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: input.workspaceId },
  });

  if (!workspace) {
    throw new NotFoundError("Workspace", input.workspaceId);
  }

  const project = await prisma.project.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      repositoryUrl: input.repositoryUrl,
    },
  });

  logger.info(`Project created: ${project.id} (${project.name})`);
  return project as unknown as Record<string, unknown>;
}

// ── List ───────────────────────────────────────────────────

async function listProjects(
  input: ManageProjectInput
): Promise<Record<string, unknown>> {
  if (!input.workspaceId) throw new ValidationError("workspaceId is required for listing");

  const projects = await prisma.project.findMany({
    where: { workspaceId: input.workspaceId },
    include: {
      _count: {
        select: { contextEntries: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    projects,
    total: projects.length,
  };
}

// ── Update ─────────────────────────────────────────────────

async function updateProject(
  input: ManageProjectInput
): Promise<Record<string, unknown>> {
  if (!input.projectId) throw new ValidationError("projectId is required");

  const existing = await prisma.project.findUnique({
    where: { id: input.projectId },
  });

  if (!existing) throw new NotFoundError("Project", input.projectId);

  const updated = await prisma.project.update({
    where: { id: input.projectId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.repositoryUrl !== undefined && { repositoryUrl: input.repositoryUrl }),
    },
  });

  logger.info(`Project updated: ${updated.id}`);
  return updated as unknown as Record<string, unknown>;
}

// ── Delete ─────────────────────────────────────────────────

async function deleteProject(
  input: ManageProjectInput
): Promise<Record<string, unknown>> {
  if (!input.projectId) throw new ValidationError("projectId is required");

  const existing = await prisma.project.findUnique({
    where: { id: input.projectId },
  });

  if (!existing) throw new NotFoundError("Project", input.projectId);

  // Cascade delete (FK constraints handle child records)
  await prisma.project.delete({ where: { id: input.projectId } });

  logger.info(`Project deleted: ${input.projectId}`);
  return { id: input.projectId, deleted: true };
}
