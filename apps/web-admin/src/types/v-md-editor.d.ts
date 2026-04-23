declare module '@kangc/v-md-editor' {
  import { DefineComponent } from 'vue'
  const VMdEditor: DefineComponent<any, any, any>
  const VMdPreview: DefineComponent<any, any, any>
  export default VMdEditor
  export { VMdPreview }
}

declare module '@kangc/v-md-editor/lib/theme/github.js' {
  const githubTheme: any
  export default githubTheme
}

declare module '@kangc/v-md-editor/lib/plugins/align' {
  const align: any
  export default align
}

declare module '@kangc/v-md-editor/lib/plugins/todo-list' {
  const todoList: any
  export default todoList
}

declare module '@kangc/v-md-editor/lib/plugins/highlight-lines' {
  const highlightLines: any
  export default highlightLines
}
