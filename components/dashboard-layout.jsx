import { LogOut, User, UserCircle } from "lucide-react";
import React, { useEffect } from "react";
import Navigation from "./navigation";
import NotificationPopover from "./notification-popover";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import Link from "next/link";
import WorkerProfileDialog from "./worker-profile-dialog";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Search from "./search";
import { useState } from "react";
import { Contact2, HardHat } from "lucide-react";

const DashboardLayout = ({ children, role }) => {
  const { data: user } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { data: users, isLoading } = useQuery(
    ["users", "asd"],
    async () => {
      const response = await axios.get("/api/users");
      return response.data;
    },
    {
      onSuccess: (data) => {
        setSearchResults(data);
      },
    }
  );

  const initialData = users;
  const [searchResults, setSearchResults] = useState(initialData);

  const handleSearch = (filteredData) => {
    setSearchResults(filteredData);
  };

  useEffect(() => {
    console.log("Search Results Updated:", searchResults);
    // You can perform other actions based on the updated searchResults here
  }, [searchResults]);

  return (
    <div className="max-w-7xl m-auto">
      {/* Header */}
      <div className="flex justify-between py-6 mb-6">
        <div className="flex items-center gap-10">
          <h1 className="font-black text-emerald-500 tracking-tight text-xl uppercase">
            Buildustry
          </h1>

          {!isLoading && (
            <div>
              <Search data={initialData} onSearch={handleSearch} />
              {searchResults && searchResults.length !== initialData.length && (
                <ul className="absolute bg-white border border-gray-300 rounded-md p-2 shadow w-100 py-2 px-4 z-10 cursor-pointer">
                  {searchResults.map((user) => (
                    <WorkerProfileDialog worker={user} key={user.id}>
                      <li className="py-2 px-3 border-b border-gray-300 ">
                        <div className="flex-col flex">
                          <p className="font-bold">{user.name}</p>
                          <p className="flex gap-2">
                            {user.role === "laborer" ? (
                              <HardHat className="text-emerald-500 " />
                            ) : (
                              <Contact2 className="text-emerald-500  " />
                            )}{" "}
                            {user.role}
                          </p>
                        </div>
                      </li>
                    </WorkerProfileDialog>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <NotificationPopover />

          <Popover>
            <PopoverTrigger>
              <UserCircle size={24} />
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col space-y-4">
                {role !== "client" && (
                  <WorkerProfileDialog worker={user}>
                    <Button
                      variant="ghost"
                      className="items-start justify-start flex gap-2"
                    >
                      <User size={24} />
                      Profile
                    </Button>
                  </WorkerProfileDialog>
                )}
                <Link
                  href="/"
                  className="items-start justify-start flex gap-2 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut size={24} />
                  Logout
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-2 border-r border-slate-200 min-h-[80vh]">
          <Navigation role={role} />
        </div>
        <div className="col-span-10 grid grid-cols-8 auto-rows-min gap-6 px-12">
          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
