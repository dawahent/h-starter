use hstarter
db.accounts.ensureIndex({
  email: "text",
  spent: 1
})
