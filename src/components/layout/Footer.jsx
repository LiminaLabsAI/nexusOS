import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto py-4 px-6 border-t border-border text-center">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Limina Labs. All rights reserved.
      </p>
    </footer>
  );
}