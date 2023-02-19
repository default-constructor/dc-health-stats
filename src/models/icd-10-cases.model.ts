export class Icd10Cases {

  constructor(
      public code: string,
      public year: number,
      public quarter: number,
      public count: number,
      public nocode: boolean
  ) {}

}