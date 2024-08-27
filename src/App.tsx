import { SignedIn } from "@clerk/clerk-react";
import { Route } from "wouter";
import Cart from "./components/Cart";
import MyWorksheets from "./components/MyWorksheets";
import Navbar from "./components/Navbar";
import Options from "./components/Options";
import { useUser } from "@clerk/clerk-react";
import posthog from "posthog-js";

function App() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (isLoaded && isSignedIn) {
    posthog.identify(user.id, {
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName,
    });
  }

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
