const express = require("express");
const Joi = require("joi");
const app = express();
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

/*********MIDDLEWARE**********/

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

/*********ROUTES**********/

const products = [
  {
    id: "1",
    name: "Banana Split Ice Cream",
    details: "Ok, so we're a little bananas.  Maybe it's the Vanilla, Chocolate, Strawberry and Banana blend in our Banana Split Ice Cream.  Or maybe it's our colorful personality.",
    price: "74.95 ",
    productImage: "uploads/banana.png",
  },
  {
    id: "2",
    name: "Birthday Cake Ice Cream",
    details: "What's better than cake and ice cream?  How about cake IN ice cream!  Birthday Cake Dippin' Dots are a blend of White & Yellow Cake Batter Ice Cream, Icing flavored Ice Cream and Cake Bits!  Who wants seconds?!",
    price: "94.95 ",
    productImage: "uploads/birthday-cake.png",
  },
  {
    id: "3",
    name: "Blue Raspberry Ice",
    details: "Blue Raspberry flavored ice.",
    price: "54.95 ",
    productImage: "uploads/blu-raspberry.png",
  },
  {
    id: "4",
    name: "Candy Cane Ice Cream",
    details: "Candy Cane is a festive mix of cool red and green peppermint ice creams, swirled together with classic Vanilla ice cream, for your holiday enjoy-mint.",
    price: "44.95 ",
    productImage: "uploads/candy-cane.png",
  },
  {
    id: "6",
    name: "Chocolate Ice Cream",
    details: "Creamy Milk Chocolate Ice Cream. Someone pass the spoon!",
    price: "60.95 ",
    productImage: "uploads/chocolate-icecream.png",
  },
  {
    id: "7",
    name: "Cookie Monster Ice Cream",
    details: "Cookie Monster features blue Sugar Cookie flavored ice cream dots, packed with not one, but two delicious cookie doughs: Chocolate Chip Cookie Dough and Chocolate Sandwich Cookie Dough.",
    price: "74.95 ",
    productImage: "uploads/cookie-monster.png",
  },
  {
    id: "8",
    name: "Cookies 'n Cream Ice Cream",
    details: "It's a cookie invasion!  Oreo® Cookie Pieces surrounded by sweet Vanilla Ice Cream make Cookies 'n Cream America's #1 most wanted Dippin' Dots flavor.",
    price: "70.95 ",
    productImage: "uploads/cookies-cream.png",
  },
];

/***********************************************************/
/********* GET: ALL PRODUCTS **********/
/***********************************************************/

app.get("/api/products", (req, res) => {
  res.send(products);
});

/***********************************************************/
/********* GET: SINGLE PRODUCT **********/
/***********************************************************/

app.get("/api/products/:id", (req, res) => {
  const product = products.find((product) => product.id === req.params.id);
  if (!product) {
    return res.status(404).send("Product with given id was not found");
  }
  res.send(product);
});

/***********************************************************/
/********* POST: ADD PRODUCT **********/
/***********************************************************/

app.post("/api/products", upload.single("productImage"), (req, res) => {
  //validate product
  const { error } = validateProduct({
    ...req.body,
    productImage: req.file?.path,
  });

  if (error) return res.status(400).send(error);

  const product = {
    id: uuidv4(),
    name: req.body.name,
    details: req.body.details,
    price: req.body.price,
    productImage: req.file.path,
  };

  products.push(product);
  res.send(product);
});

/***********************************************************/
/********* PUT: UPDATE PRODUCT **********/
/***********************************************************/

app.put("/api/products/:id", upload.single("productImage"), (req, res) => {
  //Find product
  const product = products.find((product) => product.id === req.params.id);
  if (!product) {
    return res.status(404).send("Product with given id was not found");
  }

  const { error } = validateUpdateProduct({
    ...req.body,
  });

  if (error) return res.status(400).send(error);

  product.name = req.body.name;
  product.details = req.body.details;
  product.price = req.body.price;
  if (req.file) {
    product.productImage = req.file.path;
  }

  res.send(product);
});

/***********************************************************/
/********* DELETE: DELETE PRODUCT **********/
/***********************************************************/

app.delete("/api/products/:id", (req, res) => {
  const product = products.find((product) => product.id === req.params.id);
  if (!product) {
    return res.status(404).send("Product with given id was not found");
  }
  const index = products.indexOf(product);
  products.splice(index, 1);

  res.send(products);
});

function validateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    details: Joi.string().min(3).max(200).required(),
    price: Joi.number().required(),
    productImage: Joi.string().required(),
  });

  return schema.validate(product);
}

function validateUpdateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    details: Joi.string().min(3).max(200).required(),
    price: Joi.number().required(),
    productImage: Joi.string(),
  });

  return schema.validate(product);
}

/********* PORT **********/
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(
    `http://localhost:${PORT} - dinlənilir...\n\n~~~Məhsullar~~~\n\nBütün məshullar üçün endpoint - /api/products\nTək məhsul üçün endpoint - /api/products/id\nYeni məhsul yaratmaq üçün endpoint - /api/products\n\nYeni məhsulun qəbul olunan formatı:\n{\nname: "string",\ndetails: "string",\nprice: "string",\nproductImage: "base64"\n}\n\nOlan məhsulu dəyişdirmək üçün endpoint - /api/products/id\n\nOlan məhsulu dəyişmək üçün qəbul olunan format:\n{\nname: "string",\ndetails: "string",\nprice: "string",\nproductImage: "base64"\n}\n\nMəhsulu silmək üçün endpoint - api/products/id\n\n\nAPI tədris məqsədi ilə istifadə olunmaq üçün yaradılıb.\nTərlan Əlicanov © 2023`
  )
);
