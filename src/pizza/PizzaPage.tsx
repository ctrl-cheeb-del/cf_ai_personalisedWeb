import React from "react";
import { pizzaStyles } from "./PizzaPage.styles";

export function PizzaPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Vinta Pizza - Authentic Wood-Fired Pizza</title>
        <style>{pizzaStyles}</style>
      </head>
      <body>
        <header>
          <div className="brand">🍕 Vinta Pizza</div>
          <nav>
            <a href="#menu">Menu</a>
            <a href="#featured">Featured</a>
            <a href="#testimonials">Reviews</a>
            <a href="#contact">Contact</a>
            <a href="#order" className="cta-button">Order Now</a>
          </nav>
        </header>

        <section id="hero">
          <div className="hero-content">
            <h1>Hand-tossed. Wood-fired. Loved.</h1>
            <p className="subtitle">Authentic Italian pizza crafted with passion and the finest ingredients</p>
            <div className="hero-buttons">
              <a href="#menu" className="button button-primary">View Menu</a>
              <a href="#contact" className="button button-secondary">Find Us</a>
            </div>
          </div>
        </section>

        <main>
          <section id="menu">
            <h2>Our Menu</h2>
            <div className="grid">
              <article className="card">
                <h3>Margherita</h3>
                <p>Fresh mozzarella, basil, San Marzano tomatoes, extra virgin olive oil</p>
                <div className="price">$12</div>
                <button className="add-to-cart">Add to Cart</button>
              </article>
              <article className="card">
                <h3>Pepperoni</h3>
                <p>Classic cupped pepperoni, house marinara, mozzarella blend</p>
                <div className="price">$14</div>
                <button className="add-to-cart">Add to Cart</button>
              </article>
              <article className="card">
                <h3>Funghi</h3>
                <p>Roasted mushrooms, fresh thyme, pecorino romano, garlic oil</p>
                <div className="price">$13</div>
                <button className="add-to-cart">Add to Cart</button>
              </article>
              <article className="card">
                <h3>Quattro Formaggi</h3>
                <p>Mozzarella, gorgonzola, parmesan, fontina cheese blend</p>
                <div className="price">$15</div>
                <button className="add-to-cart">Add to Cart</button>
              </article>
              <article className="card">
                <h3>Diavola</h3>
                <p>Spicy salami, chili honey drizzle, fior di latte, calabrian peppers</p>
                <div className="price">$15</div>
                <button className="add-to-cart">Add to Cart</button>
              </article>
              <article className="card">
                <h3>Prosciutto e Rucola</h3>
                <p>Thinly sliced prosciutto, fresh arugula, shaved parmesan, balsamic glaze</p>
                <div className="price">$16</div>
                <button className="add-to-cart">Add to Cart</button>
              </article>
              <article className="card">
                <h3>Calzone</h3>
                <p>Ricotta, mozzarella, prosciutto cotto, folded & oven-baked golden</p>
                <div className="price">$11</div>
                <button className="add-to-cart">Add to Cart</button>
              </article>
              <article className="card">
                <h3>Veggie Supreme</h3>
                <p>Bell peppers, red onions, olives, mushrooms, fresh tomatoes, basil</p>
                <div className="price">$13</div>
                <button className="add-to-cart">Add to Cart</button>
              </article>
            </div>
          </section>

        </main>
      </body>
    </html>
  );
}


