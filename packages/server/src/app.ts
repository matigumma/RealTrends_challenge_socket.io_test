import * as io from "socket.io";

interface Product {
  title: string;
  description: string;
  image: string;
  key: string;
}

interface Vote {
  user: string;
  product: Product["key"];
  review?: string;
  createdAt: number;
}

const server = new io.Server(5000, {
  cors: {
    origin: "http://localhost:3000",
  },
});

var products: Product[] = [
  {
    title: "Red Scarf",
    description: "A pretty red scarf.",
    image: "https://cdn.pixabay.com/photo/2016/10/02/22/17/red-t-shirt-1710578_1280.jpg",
    key: "p1",
  },
  {
    title: "Blue T-Shirt",
    description: "A pretty blue t-shirt",
    image:
      "https://imprint.com/components/com_virtuemart/shop_image/product/ba_55d64e362c237_g200_aj_studio_1451990362.jpg",
    key: "p2",
  },
];

var votes: Vote[] = [
  {
    user: "u1",
    product: "p1",
    review: "I love this product!",
    createdAt: 1555016400000,
  },
  {
    user: "u2",
    product: "p1",
    review: "I love this product too.!",
    createdAt: 1554930000000,
  },
  {
    user: "u2",
    product: "p2",
    review: "is good!",
    createdAt: 1554930000200,
  },
  {
    user: "u3",
    product: "p2",
    review: "is good too!",
    createdAt: 1554930000300,
  },
  {
    user: "u1",
    product: "p2",
    review: "hoo!",
    createdAt: 1554930000400,
  },
];

server.on("connection", (socket) => {
  socket.emit("state", {products, votes});

  socket.on(
    "newVote",
    ({
      user,
      product,
      review,
      createdAt,
    }: {
      user: string;
      product: string;
      review: string | null;
      createdAt: number;
    }) => {
      console.log("newVote", {user, product, review, createdAt});

      const findex = votes.findIndex((vote) => vote.user === "me" && vote.product !== product);

      if (findex !== -1) {
        votes.splice(findex, 1);
      }

      votes.push({
        user,
        product,
        review: review || "",
        createdAt,
      });

      socket.emit("state", {products, votes});
    },
  );
});
