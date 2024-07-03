import { SignedIn } from "@clerk/clerk-react";
import { Route } from "wouter";
import Cart from "./components/Cart";
import MyWorksheets from "./components/MyWorksheets";
import Navbar from "./components/Navbar";
import Options from "./components/Options";

//
function App() {
  return (
    <div>
      <Navbar />
      <SignedIn>
        <Route path="/">
          <Options />
        </Route>
        <Route path="/worksheets">
          <MyWorksheets />
        </Route>
        <Route path="/cart">
          <Cart />
        </Route>
      </SignedIn>
    </div>
  );
}

export default App;
