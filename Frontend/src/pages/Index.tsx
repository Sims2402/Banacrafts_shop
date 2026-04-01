import React from "react";
import { Routes, Route } from "react-router-dom";

// PUBLIC
import Home from "./public/About";
import Artisans from "./public/Artisans";
import Awareness from "./public/Awareness";
import AwarenessArticle from "./public/AwarenessArticle";

// ADMIN
import AdminArtisans from "./admin/AdminArtisans";
import AdminAwareness from "./admin/AdminAwareness";

// FALLBACK
import NotFound from "./NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<Home />} />
      <Route path="/artisans" element={<Artisans />} />
      <Route path="/awareness" element={<Awareness />} />
      <Route path="/awareness/:id" element={<AwarenessArticle />} />

      {/* ADMIN */}
      <Route path="/admin/artisans" element={<AdminArtisans />} />
      <Route path="/admin/awareness" element={<AdminAwareness />} />

      {/* FALLBACK */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;