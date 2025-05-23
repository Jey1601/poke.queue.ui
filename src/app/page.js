"use client"

import { useState, useEffect } from "react"
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import {PositiveNumberInput} from "@/components/ui/input"
import PokemonTypeSelector from "@/components/pokemon-type-selector"
import ReportsTable from "@/components/reports-table"
import { getPokemonTypes } from "@/services/pokemon-service"
import { getReports, createReport, deleteReport } from "@/services/report-service"

export default function PokemonReportsPage() {
  const [pokemonTypes, setPokemonTypes] = useState([])
  const [reports, setReports] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [loadingReports, setLoadingReports] = useState(true)
  const [creatingReport, setCreatingReport] = useState(false)
  const [error, setError] = useState(null)
  const [selectedType, setSelectedType] = useState("")
  const [pokemonQty, setPokemonQty] = useState("");

  // Cargar los tipos de Pokémon
  useEffect(() => {
    const loadPokemonTypes = async () => {
      try {
        setLoadingTypes(true)
        setError(null)
        const types = await getPokemonTypes()
        setPokemonTypes(types)
        setLoadingTypes(false)
      } catch (error) {
        console.error("Error loading Pokemon types:", error)
        setError("Error al cargar los tipos de Pokémon. Por favor, intenta de nuevo más tarde.")
        setLoadingTypes(false)
      }
    }

    loadPokemonTypes()
  }, [])

  // Función para cargar los reportes
  const loadReports = async () => {
    try {
      setLoadingReports(true)
      setError(null)
      const reportData = await getReports()
      setReports(reportData)
      setLoadingReports(false)
      return reportData
    } catch (error) {
      console.error("Error loading reports:", error)
      setError("Error al cargar los reportes. Por favor, intenta de nuevo más tarde.")
      setLoadingReports(false)
      throw error
    }
  }

  // Función para refrescar la tabla
  const handleRefreshTable = async () => {
    try {
      await loadReports()
      return true
    } catch (error) {
      throw error
    }
  }

  // Cargar los reportes al iniciar
  useEffect(() => {
    loadReports()
  }, [])

  // Función para capturar todos los Pokémon del tipo seleccionado
  const catchThemAll = async () => {
    if (!selectedType) return

    try {
      setCreatingReport(true)

      // Crear un nuevo reporte usando la API
      await createReport(selectedType, pokemonQty)

      // Mostrar notificación de éxito
      toast.success(`Se ha generado un nuevo reporte para el tipo ${selectedType} con ${pokemonQty} Pokémon.`);

      // Refrescar la tabla para mostrar el nuevo reporte
      await loadReports()

      setCreatingReport(false)
    } catch (error) {
      console.error("Error creating report:", error)

      // Mostrar notificación de error
      toast.error("No se pudo crear el reporte. Por favor, intenta de nuevo.")

      setCreatingReport(false)
    }
  }

  // Función para descargar el CSV
  const handleDownloadCSV = (url) => {
    window.open(url, "_blank")
  }

  const handleDelete = async (reportId) => {
    if (!reportId) return;  // Verifica si el ID del reporte es válido
  
    try {
        // Llamada a la API para eliminar el reporte
        const response = await deleteReport(reportId);
        
        // Verifica si la eliminación fue exitosa
        if (response && response[0] && response[0].blob_deletion) {
            const blobDeletion = response[0].blob_deletion;

            // Si la eliminación del blob fue exitosa
            if (blobDeletion.success) {
                toast.success(`El reporte con ID ${reportId} ha sido eliminado correctamente.`);
            } else {
                // Si la eliminación del blob falló, mostramos el mensaje de error
                toast.error(`Error al eliminar el reporte con ID ${reportId}: ${blobDeletion.message}`);
            }
        } else {
            toast.error("Error al eliminar el reporte. No se pudo procesar la eliminación.");
        }

        // Refrescar la tabla de reportes para reflejar la eliminación
        await loadReports();
      
    } catch (error) {
        console.error("Error deleting report:", error);

        // Mostrar notificación de error
        toast.error("No se pudo eliminar el reporte. Por favor, intenta de nuevo.");

        setDeletingReport(false);  // Finalizar el proceso de eliminación
    }
};

  const isLoading = loadingTypes || loadingReports

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">Pokémon Reports Generator</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-2/3">
              <PokemonTypeSelector
                pokemonTypes={pokemonTypes}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                loading={loadingTypes}
              />
            </div>
            <div className="w-full md:w-2/3">
            <PositiveNumberInput
                value={pokemonQty}
                onValueChange={setPokemonQty} 
                placeholder="Ingresa la cantidad de Pokémon"
                className="w-full"
                disabled={isLoading || creatingReport}
              />
            </div>
            <div className="w-full md:w-1/3">
              <Button
                onClick={catchThemAll}
                disabled={!selectedType || isLoading || creatingReport}
                className="w-full font-bold"
              >
                {creatingReport ? "Creating..." : isLoading ? "Loading..." : "Catch them all!"}
              </Button>
            </div>
          </div>

          <ReportsTable
            reports={reports}
            loading={loadingReports}
            onRefresh={handleRefreshTable}
            onDownload={handleDownloadCSV}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  )
}