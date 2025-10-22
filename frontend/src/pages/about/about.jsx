import React from "react";
import './about.css'

export default function About(){
    return(
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">About Us</h1>
            <p className="text-slate-700 leading-relaxed">
                Volunteer Match connects volunteers with community events based on location,
                time slots, and skills. Our mission is to make helping out simple and impactful.
            </p>
            <section className="mt-8 space-y-3">
                <h2 className="text-xl font-semibold">What were building</h2>
                <ul className="list-disc pl-6 text-slate-700">
                    <li>Smart matching by location, time, and skills</li>
                    <li>Clean dashboards for events and volunteers</li>
                    <li>Privacy-first, simple login and profiles</li>
                </ul>
            </section>
        </main>
    );
}