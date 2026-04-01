import { useEffect, useState } from "react";
import api from "../utils/api";

const NAVBAR_SECTIONS = ["gore-tex", "backpacks", "footwear", "equipment", "bottles"];

export function useNavSections() {
  const [navSections, setNavSections] = useState([]);
  const [allSections, setAllSections] = useState([]);

  useEffect(() => {
    api.get("sections/").then((res) => {
      setAllSections(res.data);
      setNavSections(
        res.data.filter((s) => NAVBAR_SECTIONS.includes(s.name.toLowerCase()))
      );
    }).catch(() => {});
  }, []);

  return { navSections, allSections };
}