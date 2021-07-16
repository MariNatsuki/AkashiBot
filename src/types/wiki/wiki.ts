import WikiJs from 'wikijs'

// Custom type for Wiki
type ArgumentTypes<F extends () => void> = F extends (...args: infer A) => any ? A : never

export type WikiArguments = ArgumentTypes<typeof WikiJs>

export interface Wiki extends Omit<ReturnType<typeof WikiJs>, 'find'> {
  api?(params?): Promise<any>
  wikitext(query: string): Promise<string>
  findImages(page: string, images?: string[]): Promise<Record<string, any>[]>
  findImagesAlt(page: string, images?: string[]): Promise<Record<string, any>[]>
  find(query: string, predicate?: (pages: Page[]) => Page): Promise<Page>
}

// Custom type for Page
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

export interface Page extends ThenArg<ReturnType<ReturnType<typeof WikiJs>['find']>> {
  rawInfo?(): Promise<any>
}
