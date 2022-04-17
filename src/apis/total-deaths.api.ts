import axios from "axios";
import {ref} from "vue";
import {TotalDeaths} from "@/models/total-deaths.model";

export const useTotalDeathsApi = () => {
  const api = axios.create({
    baseURL: "http://localhost:8080"
  })

  const loading = ref(false)
  const result = ref()
  const error = ref()

  const loadTotalDeaths = async () => {
    loading.value = true
    error.value = undefined

    await api.get("/total-deaths?from=2021")
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
    loading,
    result,
    error
  }
}
