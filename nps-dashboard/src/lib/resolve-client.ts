import type { ClientConfig, StageDef } from './config';
import { getClient as getCodeClient } from './config';
import { getClientRecord, listClients, listQuestionMap, listStages, stagesFromRecords, type ClientRecord } from './clients';
import { hasDatabase } from './db';
import type { MappingLookup } from './normalize';

export interface ResolvedClient {
  client: ClientConfig;
  record: ClientRecord;
  /** Null bila client masih memakai konfigurasi di kode. */
  mapping: MappingLookup | null;
  stages: StageDef[] | null;
}

/**
 * Ambil konfigurasi client: database lebih dulu, lalu fallback ke kode.
 * Mapping & tahap hanya tersedia bila client dikelola lewat database.
 */
export async function resolveClient(slug: string): Promise<ResolvedClient | null> {
  const record = hasDatabase() ? await getClientRecord(slug) : null;

  if (!record) {
    const codeClient = getCodeClient(slug);
    if (!codeClient) return null;
    return {
      client: codeClient,
      record: { ...codeClient, id: 0, passwordHash: null, isActive: true },
      mapping: null,
      stages: null,
    };
  }

  const [stageRows, mapRows] = await Promise.all([listStages(record.id), listQuestionMap(record.id)]);

  const mapping: MappingLookup | null =
    mapRows.length > 0
      ? new Map(
          mapRows.map((row) => [
            row.questionId,
            { key: row.questionId, label: row.label, stageKey: row.stageKey },
          ]),
        )
      : null;

  const stages = stageRows.length > 0 ? stagesFromRecords(stageRows, mapRows) : null;

  return { client: record, record, mapping, stages };
}

export async function resolveAllClients(): Promise<ResolvedClient[]> {
  const records = await listClients();
  const resolved: ResolvedClient[] = [];

  for (const record of records) {
    const item = await resolveClient(record.slug);
    if (item) resolved.push(item);
  }

  return resolved;
}

export { listClients };
