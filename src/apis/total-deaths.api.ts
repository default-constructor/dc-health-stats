import axios from "axios";
import {ref} from "vue";
import {TotalDeaths} from "@/models/total-deaths.model";

export const useTotalDeathsApi = () => {
  const api = axios.create({
    baseURL: "http://localhost:8081"
  })

  const loading = ref(false)
  const result = ref()
  const error = ref()

  const loadTotalDeaths = async (from?: number, to?: number, ageGroups?: string[]) => {
    loading.value = true
    error.value = undefined

    let params = "?from=" + ((from && from > 2005) ? from : 2005)

    if (to && to >= 2005) {
      params += "&to=" + to
    }

    if (ageGroups && ageGroups.length > 0) {
      params += "&ageGroups=" + ageGroups.join(",")
    }

    await api.get("/total-deaths" + params)
        .then((r) => {
          result.value = r.data as TotalDeaths[]
        })
        .catch((e) => {
          error.value = "Failed to load total deaths: " + e.message
        })
        .finally(() => {
          loading.value = false
        })
  }

  return {
    loadTotalDeaths,
    totalDeathsLoading: loading,
    totalDeathsResult: result,
    totalDeathsError: error
  }
}
