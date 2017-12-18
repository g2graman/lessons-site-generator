import fs from 'fs'
import remark from 'remark'
import html from 'remark-html'
import slug from 'remark-slug'
import heading from 'remark-autolink-headings'

const app = remark()
app.use([slug, heading, html])

export default (file) => {
  let markdown = fs.readFileSync(file).toString('utf8')
  const { contents } = app.processSync(markdown)

  return contents
}
