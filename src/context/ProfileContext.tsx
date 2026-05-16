"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ProfileData {
  nickname: string;
  major: string;
}

interface ProfileContextType {
  profile: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: { nickname: "", major: "" },
  updateProfile: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>({ nickname: "", major: "" });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vc_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse profile data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => {
      const newProfile = { ...prev, ...data };
      localStorage.setItem("vc_profile", JSON.stringify(newProfile));
      return newProfile;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {/* Prevents hydration mismatch by rendering children after client-side load */}
      {isLoaded ? children : <div className="min-h-screen bg-orange-50 opacity-0" />}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
