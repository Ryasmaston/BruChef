import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface InventoryProps {
  isAuthenticated: boolean
}

export default function Inventory({ isAuthenticated }: InventoryProps) {
  return isAuthenticated
}
