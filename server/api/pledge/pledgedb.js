use hstarter
db.orders.ensureIndex({
  buyerid: "text",
  date: 1,
  projectid: "text"
})
