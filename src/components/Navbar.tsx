import { useReactiveVar } from "@apollo/client";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useClerk,
} from "@clerk/clerk-react";
import { Link, useLocation } from "wouter";
import { cartItemsVar } from "./Cart/data.tsx";
import posthog from "posthog-js";

export default function Navbar() {
  const { signOut } = useClerk();

  const cartItems = useReactiveVar(cartItemsVar);
  const [location] = useLocation();

  const onSignOut = () => {
    posthog.reset();
    signOut();
  };

  return (
    <div className="p-4 sticky top-0 z-10">
      <div className="navbar bg-primary rounded-box">
        <div className="navbar-start">
          <Link href="/">
            <div className="text-xl">Teebloc</div>
          </Link>
        </div>
        <div className="navbar-end space-x-2">
          <SignedOut>
            <SignInButton>
              <a className="btn">Log in</a>
            </SignInButton>
            <SignUpButton>
              <a className="btn btn-outline">Sign up</a>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/worksheets">
              <div
                className={`btn btn-outline ${
                  location === "/worksheets" && "btn-active"
                }`}
              >
                My Worksheets
              </div>
            </Link>
            <Link href="/cart">
              <div
                className={`btn btn-outline ${
                  location === "/cart" && "btn-active"
                }`}
              >
                Worksheet Cart
                {cartItems.length > 0 && (
                  <div className="badge">{cartItems.length}</div>
                )}
              </div>
            </Link>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-outline">
                Profile
              </div>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4"
              >
                <li>
                  <a onClick={onSignOut}>Sign out</a>
                </li>
              </ul>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
