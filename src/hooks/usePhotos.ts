import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../data/queryKeys'
import { recordsRepository } from '../data/recordsRepository'
import type { PhotoUpdate } from '../types'

export function usePhotosQuery(tripId?: string) {
  return useQuery({
    queryKey: queryKeys.records.list(tripId),
    queryFn: ({ signal }) => recordsRepository.list(tripId, signal),
  })
}

async function invalidateRecordLists(client: ReturnType<typeof useQueryClient>, tripId?: string) {
  const invalidations = [
    client.invalidateQueries({
      queryKey: queryKeys.records.list(),
      exact: true,
    }),
  ]
  if (tripId) {
    invalidations.push(
      client.invalidateQueries({
        queryKey: queryKeys.records.list(tripId),
        exact: true,
      }),
    )
  }
  await Promise.all(invalidations)
}

/** Write-only record API. It never starts a records query. */
export function usePhotoMutations(activeTripId?: string) {
  const client = useQueryClient()

  const createMutation = useMutation({
    mutationFn: recordsRepository.create,
    onSuccess: async (_, input) => {
      await Promise.all([
        invalidateRecordLists(client, input.tripId),
        client.invalidateQueries({ queryKey: queryKeys.trips.list(), exact: true }),
        client.invalidateQueries({
          queryKey: queryKeys.trips.detail(input.tripId),
          exact: true,
        }),
      ])
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PhotoUpdate }) =>
      recordsRepository.update(id, updates),
    onSuccess: () => invalidateRecordLists(client, activeTripId),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recordsRepository.delete(id),
    onSuccess: async () => {
      const invalidations = [
        invalidateRecordLists(client, activeTripId),
        client.invalidateQueries({ queryKey: queryKeys.trips.list(), exact: true }),
      ]
      if (activeTripId) {
        invalidations.push(
          client.invalidateQueries({
            queryKey: queryKeys.trips.detail(activeTripId),
            exact: true,
          }),
        )
      }
      await Promise.all(invalidations)
    },
  })

  return {
    createRecord: (input: Parameters<typeof recordsRepository.create>[0]) =>
      createMutation.mutateAsync(input),
    updatePhoto: async (id: string, updates: PhotoUpdate): Promise<void> => {
      await updateMutation.mutateAsync({ id, updates })
    },
    deletePhoto: (id: string) => deleteMutation.mutateAsync(id),
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
