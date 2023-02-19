import axios from "axios";
import {ref} from "vue";
import {Icd10Cases} from "@/models/icd-10-cases.model";

export const useIcd10CasesApi = () => {
  const api = axios.create({
    baseURL: "http://localhost:8081"
  })

  const loading = ref(false)
  const result = ref()
  const error = ref()

  const loadIcd10Cases = async (code: string, from?: number, to?: number, nocode?: boolean) => {
    loading.value = true
    error.value = undefined

    let params = `?code=${code}&from=${(from && from > 2016) ? from : 2016}`

    if (to && to >= 2016) {
      params += "&to=" + to
    }

    if (nocode !== undefined) {
      params += `&nocode=${nocode}`
    }

    await api.get("/icd-10-cases" + params)
        .then((r) => {
          result.value = r.data as Icd10Cases[]
        })
        .catch((e) => {
          error.value = "Failed to load ICD-10 cases: " + e.message
        })
        .finally(() => {
          loading.value = false
        })
  }

  return {
    loadIcd10Cases,
    icd10CasesLoading: loading,
    icd10CasesResult: result,
    icd10CasesError: error
  }
}
