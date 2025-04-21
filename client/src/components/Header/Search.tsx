'use client'

import styles from './Search.module.scss'
import { IoSearch } from 'react-icons/io5'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Search() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleEnterPress = () => {
        router.push(`/search?q=${query}&category=users`);
    }

    return (
        <div className={styles.searchContainer}>
            <label htmlFor="search">
                <IoSearch />
                <input
                    type="text"
                    name="search"
                    id="search"
                    value={query}
                    placeholder="Search syncspace..."
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleEnterPress()
                        }
                    }}
                />
            </label>
        </div>
    )
}
