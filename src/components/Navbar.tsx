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
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const { signOut } = useClerk();
  const cartItems = useReactiveVar(cartItemsVar);
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const onSignOut = () => {
    posthog.reset();
    signOut();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="p-4 sticky top-0 z-10">
      <div className="navbar bg-primary rounded-box">
        <div className="navbar-start">
          <Link href="/">
            <div className="text-xl">Teebloc</div>
          </Link>
        </div>

        <div className="flex sm:hidden ml-auto relative" ref={menuRef}>
          <button
            className="btn btn-square btn-ghost"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 menu bg-primary rounded-box w-44 shadow-lg space-y-2">
              <NavItems
                location={location}
                cartItems={cartItems}
                onSignOut={onSignOut}
              />
            </div>
          )}
        </div>

        <div className="navbar-end space-x-2 hidden sm:flex">
          <NavItems
            location={location}
            cartItems={cartItems}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </div>
  );
}

// New component for repeated nav items
function NavItems({
  location,
  cartItems,
  onSignOut,
}: {
  location: string;
  cartItems: any[]; // Replace 'any' with the correct type if known
  onSignOut: () => void;
}) {
  return (
    <>
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
            onClick={() => {
              posthog.capture("worksheet_cart_clicked", {
                cartItemsCount: cartItems.length,
              });
            }}
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
    </>
  );
}
