use hstarter
db.projects.ensureIndex({
  date: 1,
  qty_pre: 1,
  qty_sold: 1,
  price: 1,
  pre_price: 1,
  name: "text"
})
