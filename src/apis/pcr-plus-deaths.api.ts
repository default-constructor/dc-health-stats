import axios from "axios";
import {ref} from "vue";
import {PcrPlusDeaths} from "@/models/pcr-plus-deaths.model";

export const usePcrPlusDeathsApi = () => {
  const api = axios.create({
    baseURL: "http://localhost:8080/pcr-plus-deaths"
  })

  const loading = ref(false)
  const result = ref()
  const error = ref()

  const loadPcrPlusDeaths = async (from?: number, to?: number) => {
    loading.value = true
    error.value = undefined

    let params = "?from=" + ((from && from > 2005) ? from : 2005)

    if (to && to >= 2005) {
      params += "&to=" + to
    }

    await api.get(params)
        .then((r) => {
          result.value = r.data as PcrPlusDeaths[]
        })
        .catch((e) => {
          error.value = "Failed to load pcr plus deaths: " + e.message
        })
        .finally(() => {
          loading.value = false
        })
  }

  return {
    loadPcrPlusDeaths,
    pcrPlusDeathsLoading: loading,
    pcrPlusDeathsResult: result,
    pcrPlusDeathsError: error
  }
}
