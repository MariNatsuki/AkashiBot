import type { ChatInputCommandInteraction, PermissionResolvable, PermissionsBitField } from 'discord.js';

import type { Command } from '../interfaces/command';

export interface PermissionResult {
  result: boolean;
  missing: string[];
}

export async function checkUserPermission(
  { userPermissions: requiredUserPermissions = [] }: Command,
  interaction: ChatInputCommandInteraction
) {
  if (!requiredUserPermissions.length) return { result: true, missing: [] };
  const userPermissions = (await interaction.guild?.members.fetch({ user: interaction.user.id }))?.permissions;
  return checkPermissions(requiredUserPermissions, userPermissions);
}

export async function checkBotPermission(
  { botPermissions: requiredBotPermissions = [] }: Command,
  interaction: ChatInputCommandInteraction
) {
  if (!requiredBotPermissions.length) return { result: true, missing: [] };
  const userPermissions = (await interaction.guild?.members.fetch({ user: interaction.client.user.id }))?.permissions;
  return checkPermissions(requiredBotPermissions, userPermissions);
}

export async function checkPermissions(
  requiredPermissions: PermissionResolvable[],
  permissions?: PermissionsBitField
): Promise<PermissionResult> {
  const missing = permissions?.missing(requiredPermissions) || [];

  return { result: !Boolean(missing?.length), missing };
}
