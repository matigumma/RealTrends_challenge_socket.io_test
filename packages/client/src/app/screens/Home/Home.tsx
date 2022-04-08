import * as React from "react";
import SocketIO from "socket.io-client";

import logo from "~/assets/logo.svg";

import styles from "./Home.module.scss";

const socket = SocketIO.io("http://localhost:5000");

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

interface State {
  products: Product[];
  votes: Vote[];
}

const Home: React.FC = () => {
  const [state, setState] = React.useState<State>({products: [], votes: []});
  const [myVote, setMyVote] = React.useState<Vote | null>(null);

  React.useEffect(() => {
    socket.on("state", (state: State) => {
      setState(state);
      state.votes.find((vote) => {
        if (vote.user === "me") {
          setMyVote(vote);
        } else {
          setMyVote(null);
        }
      });
    });

    socket.on("disconnect", () => console.log("disconnect"));
  }, []);

  const emitMyVote = (product: Product["key"]) => {
    if (!myVote || myVote.product !== product) {
      const review = prompt("Please enter your review");

      if (review) {
        const createdAt = new Date().getTime();

        socket.emit("newVote", {user: "me", product, review, createdAt});
      }
    } else {
      alert("🔴 You already voted for this product");
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <img alt="RealTrends" src={logo} width={180} />
          <h1>Challenge</h1>
        </div>
        <h3>Lets get this party started</h3>
      </header>
      <section className={styles.products}>
        <h2>Products</h2>
        <span>(Click to vote)</span>
        <div className={styles.articlesContainer}>
          {state.products.map((product) => {
            const productVotes = state.votes.filter((vote) => vote.product === product.key);
            const totalVotes = productVotes.length;
            const percent = (totalVotes * 100) / state.votes.length;
            const hue = (totalVotes * 365) / state.votes.length;

            return (
              <article key={product.key} onClick={() => emitMyVote(product.key)}>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <img alt={product.title} src={product.image} />
                <p>
                  {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                </p>
                <ul>
                  {productVotes.map((vote) => (
                    <li key={`${vote.createdAt}`}>
                      <b>{vote.user}</b>
                      <span>: {vote.review}</span>
                    </li>
                  ))}
                </ul>
                <aside style={{height: `${percent}%`, backgroundColor: `hsl(${hue}, 100%, 50%)`}} />
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Home;
