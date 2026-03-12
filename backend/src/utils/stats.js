const calculateAveragePrice = (items) => {
  let totalPrice = 0;

  // for loop is most performant, much faster than reduce for large arrays, and slightly faster than forOf. I intentionally used good old for loop here and leaved commented alternative for demonstration purposes.
  for (let i = 0; i < items.length; i++) {
    totalPrice += items[i].price;
  }

  // for (const item of items) {
  //   totalPrice += item.price;
  // }

  return totalPrice / items.length;
};

module.exports = { calculateAveragePrice };