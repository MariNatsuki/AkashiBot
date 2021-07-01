import WikiJs from 'wikijs'

// Custom type for Wiki
type ArgumentTypes<F extends () => void> = F extends (...args: infer A) => any ? A : never

export type WikiArguments = ArgumentTypes<typeof WikiJs>

export interface Wiki extends Omit<ReturnType<typeof WikiJs>, 'find'> {
  find(query: string, predicate?: (pages: Page[]) => Page): Promise<Page>
}

// Custom type for Page
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

export interface Page extends ThenArg<ReturnType<ReturnType<typeof WikiJs>['find']>> {
  rawInfo?(): Promise<any>
}
