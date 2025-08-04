import {
  Chart as ChartJS,
  type ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { useSpiceSimulation } from "../hooks/useSpiceSimulation"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#387908"]

const formatTimeWithUnits = (seconds: number) => {
  if (seconds === 0) return "0s"
  const absSeconds = Math.abs(seconds)

  let unit = "s"
  let scale = 1
  if (absSeconds < 1e-12) {
    unit = "fs"
    scale = 1e15
  } else if (absSeconds < 1e-9) {
    unit = "ps"
    scale = 1e12
  } else if (absSeconds < 1e-6) {
    unit = "ns"
    scale = 1e9
  } else if (absSeconds < 1e-3) {
    unit = "us"
    scale = 1e6
  } else if (absSeconds < 1) {
    unit = "ms"
    scale = 1e3
  }

  return `${parseFloat((seconds * scale).toPrecision(3))}${unit}`
}

export const SpicePlot = ({ spiceString }: { spiceString: string }) => {
  const { plotData, nodes, isLoading, error } = useSpiceSimulation(spiceString)

  if (isLoading) {
    return (
      <div
        style={{
          height: "300px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Running simulation...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          height: "300px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red",
        }}
      >
        Error: {error}
      </div>
    )
  }

  if (plotData.length === 0) {
    return (
      <div
        style={{
          height: "300px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        No data to plot. Check simulation output or SPICE netlist.
      </div>
    )
  }

  const chartData = {
    datasets: nodes.map((node, i) => ({
      label: node,
      data: plotData.map((p) => ({
        x: Number(p.name),
        y: p[node] as number,
      })),
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length],
      fill: false,
      tension: 0.1,
    })),
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "sans-serif",
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            if (tooltipItems.length > 0) {
              const item = tooltipItems[0]
              return formatTimeWithUnits(item.parsed.x)
            }
            return ""
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Time",
          font: {
            family: "sans-serif",
          },
        },
        ticks: {
          callback: (value) => formatTimeWithUnits(value as number),
          font: {
            family: "sans-serif",
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Voltage",
          font: {
            family: "sans-serif",
          },
        },
        ticks: {
          font: {
            family: "sans-serif",
          },
        },
      },
    },
  }

  return (
    <div style={{ position: "relative", height: "300px", width: "100%" }}>
      <Line options={options} data={chartData} />
    </div>
  )
}
