import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../data/queryKeys'
import { tripsRepository, type TripCityCreateInput } from '../data/tripsRepository'
import type { TripCityInput, TripCreateInput, TripUpdate } from '../types'

export function useTripsQuery() {
  return useQuery({
    queryKey: queryKeys.trips.list(),
    queryFn: ({ signal }) => tripsRepository.list(signal),
  })
}

export function useTripQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.trips.detail(id),
    queryFn: ({ signal }) => tripsRepository.getById(id, signal),
    enabled: Boolean(id),
  })
}

/** Write-only trip API. It never starts a trip list query. */
export function useTripMutations() {
  const client = useQueryClient()

  const createMutation = useMutation({
    mutationFn: ({ trip, cities }: { trip: TripCreateInput; cities: TripCityCreateInput[] }) =>
      tripsRepository.create(trip, cities),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: queryKeys.trips.list(),
        exact: true,
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TripUpdate }) =>
      tripsRepository.update(id, updates),
    onSuccess: async (_, { id }) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.trips.list(), exact: true }),
        client.invalidateQueries({ queryKey: queryKeys.trips.detail(id), exact: true }),
      ])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tripsRepository.delete(id),
    onSuccess: async (_, id) => {
      client.removeQueries({ queryKey: queryKeys.trips.detail(id), exact: true })
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.trips.list(), exact: true }),
        client.invalidateQueries({ queryKey: queryKeys.records.all }),
      ])
    },
  })

  const addCityMutation = useMutation({
    mutationFn: ({ tripId, city }: { tripId: string; city: TripCityInput }) =>
      tripsRepository.addCity(tripId, city),
    onSuccess: async (_, { tripId }) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.trips.list(), exact: true }),
        client.invalidateQueries({ queryKey: queryKeys.trips.detail(tripId), exact: true }),
      ])
    },
  })

  const removeCityMutation = useMutation({
    mutationFn: ({ cityId }: { cityId: string; tripId?: string }) =>
      tripsRepository.removeCity(cityId),
    onSuccess: async (_, { tripId }) => {
      const invalidations = [
        client.invalidateQueries({ queryKey: queryKeys.trips.list(), exact: true }),
      ]
      if (tripId) {
        invalidations.push(
          client.invalidateQueries({
            queryKey: queryKeys.trips.detail(tripId),
            exact: true,
          }),
        )
      } else {
        invalidations.push(client.invalidateQueries({ queryKey: queryKeys.trips.all }))
      }
      await Promise.all(invalidations)
    },
  })

  return {
    createTrip: (trip: TripCreateInput, cities: TripCityCreateInput[]) =>
      createMutation.mutateAsync({ trip, cities }),
    updateTrip: (id: string, updates: TripUpdate) => updateMutation.mutateAsync({ id, updates }),
    deleteTrip: (id: string) => deleteMutation.mutateAsync(id),
    addCity: (tripId: string, city: TripCityInput) => addCityMutation.mutateAsync({ tripId, city }),
    removeCity: (cityId: string, tripId?: string) =>
      removeCityMutation.mutateAsync({ cityId, tripId }),
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      addCityMutation.isPending ||
      removeCityMutation.isPending,
  }
}
