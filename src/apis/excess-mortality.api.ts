import axios from "axios";
import {ref} from "vue";
import {ExcessMortality} from "@/models/excess-mortality.model";

export const useExcessMortalityApi = () => {
  const api = axios.create({
    baseURL: "http://localhost:8081"
  })

  const loading = ref(false)
  const result = ref()
  const error = ref()

  const loadExcessMortalities = async (from?: number, to?: number, ageGroups?: string[]) => {
    loading.value = true
    error.value = undefined

    let params = "?from=" + ((from && from > 2005) ? from : 2005)

    if (to && to >= 2005) {
      params += "&to=" + to
    }

    if (ageGroups && ageGroups.length > 0) {
      params += "&ageGroups=" + ageGroups.join(",")
    }

    await api.get("/excess-mortality" + params)
        .then((r) => {
          result.value = r.data as ExcessMortality[]
        })
        .catch((e) => {
          error.value = "Failed to load excess mortalities: " + e.message
        })
        .finally(() => {
          loading.value = false
        })
  }

  return {
    loadExcessMortalities,
    excessMortalitiesLoading: loading,
    excessMortalitiesResult: result,
    excessMortalitiesError: error
  }
}
