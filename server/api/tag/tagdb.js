use hstarter
db.tags.ensureIndex({
  name: "text",
  projectId: "text",
  category: "text"
})
