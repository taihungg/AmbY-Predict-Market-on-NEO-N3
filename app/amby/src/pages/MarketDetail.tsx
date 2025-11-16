import { useState } from "react";
import QuestCard from "../components/QuestCard";

type Props = {
  darkMode?: boolean;
  onDarkModeChange?: (isDark: boolean) => void;
};

export default function MarketDetail({ darkMode = false, onDarkModeChange }: Props) {
  const [connected, setConnected] = useState(false);

  return (
    <QuestCard 
      connected={connected} 
      onConnect={setConnected}
      darkMode={darkMode}
      onDarkModeChange={onDarkModeChange}
    />
  );
}
