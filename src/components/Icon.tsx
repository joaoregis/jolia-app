// src/components/Icon.tsx

import React from 'react';
import {
  Home, Briefcase, PiggyBank, Landmark, Wallet, Car, Heart, GraduationCap, Plane,
  ShoppingCart, Gift, Dog, Cat, Building, Gamepad2, Utensils, Laptop, Smartphone,
  Tv, Film, Music, Book, HeartPulse, Sprout, TreePine, Ship, Train, Bike, Star, Sun, LucideProps
} from 'lucide-react';

// Mapeia o nome do ícone (string) para o componente React correspondente
export const iconMap: { [key: string]: React.FC<LucideProps> } = {
  Home, Briefcase, PiggyBank, Landmark, Wallet, Car, Heart, GraduationCap, Plane,
  ShoppingCart, Gift, Dog, Cat, Building, Gamepad2, Utensils, Laptop, Smartphone,
  Tv, Film, Music, Book, HeartPulse, Sprout, TreePine, Ship, Train, Bike, Star, Sun
};

interface IconProps extends LucideProps {
  name: string;
}

// Componente que renderiza um ícone com base no seu nome
export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = iconMap[name] || Home; // Usa 'Home' como ícone padrão
  return <LucideIcon {...props} />;
};

// Exporta a lista de nomes de ícones para ser usada no seletor
export const iconNames = Object.keys(iconMap);

