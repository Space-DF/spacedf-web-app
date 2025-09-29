import { ChartType, Orientation } from '@/widget-models/chart'
import {
  AggregationFunction,
  TimeFrameTab,
  WidgetType,
} from '@/widget-models/widget'
import { v4 as uuidv4 } from 'uuid'
import { TimeFormat } from './date-format'
import { GaugeType } from '@/widget-models/gauge'
import { OPERATORS } from '@/containers/dashboard/components/widget-selected/components/table-widget/table.const'
import dayjs from 'dayjs'
import { MapType } from '@/validator'

export const DEMO_WIDGET_DASHBOARD = [
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '1',
      type: WidgetType.Unit,
      widget_info: {
        name: 'Current Speed',
        appearance: {
          show_value: true,
        },
      },
      value: 70,
      unit: 'km/h',
      status: 'On',
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '2',
      widget_info: {
        name: 'Total Trip',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Unit,
      value: 12,
      unit: 'trips',
      x: 4,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '3',
      type: WidgetType.Unit,
      widget_info: {
        name: 'Min. Speed of today',
        appearance: {
          show_value: true,
        },
      },
      value: 0,
      unit: 'km/h',
      x: 0,
      y: 3,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '4',
      type: WidgetType.Unit,
      widget_info: {
        name: 'AVG. Speed of today',
        appearance: {
          show_value: true,
        },
      },
      value: 84,
      unit: 'km/h',
      x: 2,
      y: 3,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '5',
      type: WidgetType.Unit,
      widget_info: {
        name: 'Max. Speed of today',
        appearance: {
          show_value: true,
        },
      },
      value: 125,
      unit: 'km/h',
      x: 4,
      y: 3,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '6',
      type: WidgetType.Chart,
      widget_info: {
        name: 'Humidity and Temperature',
        appearance: {
          show_value: true,
        },
      },
      axes: {
        y_axis: {
          unit: '',
          orientation: Orientation.Left,
        },
        hide_axis: false,
        is_show_grid: true,
        format: TimeFormat.TIME_24H,
      },
      timeframe: {
        aggregation_function: AggregationFunction.Average,
        from: dayjs().startOf('hour').toDate(),
        until: dayjs().endOf('hour').toDate(),
        type: TimeFrameTab.Hour,
      },
      x: 0,
      y: 6,
      w: 6,
      h: 4,
      minW: 6,
      minH: 4,
      sources: [
        {
          legend: 'Humidity',
          field: 'humidity',
          color: 'FAAFC6',
          show_legend: true,
          chart_type: ChartType.AreaChart,
          device_id: '1',
        },
        {
          legend: 'Temperature',
          field: 'temperature',
          color: 'FA8750',
          show_legend: true,
          chart_type: ChartType.AreaChart,
          device_id: '1',
        },
      ],
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '7',
      type: WidgetType.Map,
      widget_info: {
        name: 'Current Location',
        appearance: {
          show_value: true,
        },
      },
      sources: [
        {
          device_id: '1',
          coordinate: [16.05198423790203, 108.21679652348709],
          map_type: MapType.RoadMap,
        },
      ],
      x: 0,
      y: 9,
      w: 6,
      h: 3,
      minW: 4,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '8',
      type: WidgetType.Table,
      widget_info: {
        name: 'All Devices Status',
        appearance: {
          show_value: true,
        },
      },
      x: 0,
      y: 12,
      w: 4,
      h: 3,
      minW: 4,
      minH: 3,
      source: {
        devices: [
          {
            device_id: '1',
            device_name: 'RAK Sticker 01',
            last_seen: '2021-01-01',
            battery: 100,
            status: 'active',
            coordinate: [16.061307485294005, 108.23972422618492],
          },
          {
            device_id: '2',
            device_name: 'RAK Sticker 02',
            last_seen: '2021-01-01',
            battery: 100,
            status: 'active',
            coordinate: [16.061307485294005, 108.23972422618492],
          },
          {
            device_id: '3',
            device_name: 'RAK Sticker 03',
            last_seen: '2021-01-01',
            battery: 100,
            status: 'active',
            coordinate: [16.061307485294005, 108.23972422618492],
          },
        ],
      },
      columns: [
        {
          column_name: 'Device Name',
          column_type: 'string',
          field: 'device_name',
        },
        {
          column_name: 'Device ID',
          column_type: 'string',
          field: 'device_id',
        },
      ],
      conditions: [],
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '9',
      type: WidgetType.Gauge,
      widget_info: {
        name: 'Battery Level',
        appearance: {
          show_value: true,
        },
      },
      source: {
        type: GaugeType.Circular,
        device_id: '1',
        field: 'battery',
        min: 0,
        max: 100,
        decimal: 0,
        values: [
          {
            color: '99D689',
            value: 0,
          },
          {
            value: 84,
            color: 'cecece',
          },
        ],
        unit: '%',
      },
      x: 5,
      y: 14,
      w: 2,
      h: 3,
      minW: 2,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '10',
      widget_info: {
        name: 'Camera DMZ 01-1511-M01',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Camera,
      x: 0,
      y: 17,
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '11',
      widget_info: {
        name: 'Camera DMZ 01-1511-M02',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Camera,
      x: 4,
      y: 17,
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '12',
      widget_info: {
        name: 'Distance Travelled Today',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Progress,
      value: 50,
      unit: 'km',
      min: 0,
      color: '#8D9DF5',
      max: 100,
      x: 0,
      y: 20,
      w: 6,
      h: 1,
      minW: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '13',
      type: WidgetType.Sensor,
      widget_info: {
        name: 'Son - Sticker',
        appearance: {
          show_value: true,
        },
      },
      color: '#95e1d9',
      value: 'On',
      x: 0,
      y: 21,
      w: 3,
      h: 1,
    },
  },
  {
    id: uuidv4(),
    dashboard: '1',
    configuration: {
      id: '14',
      widget_info: {
        name: 'Theft Movement Alert',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Switch,
      color: '#95e1d9',
      x: 4,
      y: 21,
      w: 3,
      h: 1,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '1',
      type: WidgetType.Text,
      content: 'This dashboard is used to manage all the RAK Stickers',
      x: 0,
      y: 0,
      w: 6,
      h: 1,
      minW: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '2',
      type: WidgetType.Chart,
      widget_info: {
        name: 'Battery Usage Trend (RAK Sticker 01)',
        appearance: {
          show_value: true,
        },
      },
      axes: {
        y_axis: {
          unit: '',
          orientation: Orientation.Left,
        },
        hide_axis: false,
        is_show_grid: true,
        format: TimeFormat.TIME_24H,
      },
      sources: [
        {
          legend: 'Battery Usage',
          field: 'battery',
          color: 'A0CFE1',
          show_legend: true,
          chart_type: ChartType.AreaChart,
          device_id: '1',
        },
      ],
      x: 0,
      y: 1,
      w: 6,
      h: 4,
      minW: 4,
      minH: 4,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '3',
      type: WidgetType.Sensor,
      widget_info: {
        name: 'Distance Travelled Today',
        appearance: {
          show_value: true,
        },
      },
      value: '50 km',
      color: '#8d9df5',
      sensor_type: 'distance',
      x: 0,
      y: 5,
      w: 4,
      h: 1,
      minW: 4,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '4',
      type: WidgetType.Sensor,
      widget_info: {
        name: 'Current location',
        appearance: {
          show_value: true,
        },
      },
      value: "107°17' - 108°20'",
      color: '#a0cfe1',
      sensor_type: 'location',
      x: 0,
      y: 6,
      w: 4,
      h: 1,
      minW: 4,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '5',
      type: WidgetType.Gauge,
      widget_info: {
        name: 'Energy for DF ...',
        appearance: {
          show_value: true,
        },
      },
      source: {
        type: GaugeType.Circular,
        device_id: '1',
        field: 'battery',
        min: 100,
        max: 300,
        decimal: 0,
        values: [
          {
            color: '99D689',
            value: 0,
          },
          {
            value: 84,
            color: 'cecece',
          },
        ],
        unit: '%',
      },
      x: 5,
      y: 5,
      w: 2,
      h: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '6',
      widget_info: {
        name: 'New Slider Widget',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Progress,
      value: 50,
      unit: 'ml',
      min: 0,
      color: '#F27877',
      max: 100,
      x: 0,
      y: 7,
      w: 6,
      h: 1,
      minW: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '7',
      type: WidgetType.Table,
      widget_info: {
        name: 'Geofencing Alerts',
        appearance: {
          show_value: true,
        },
      },
      source: [
        {
          device_id: '1',
          device_name: 'RAK Sticker 01',
          last_seen: '2021-01-01',
          battery: 60,
          status: 'active',
          coordinate: [16.061307485294005, 108.23972422618492],
        },
        {
          device_id: '2',
          device_name: 'RAK Sticker 02',
          last_seen: '2021-01-01',
          battery: 70,
          status: 'active',
          coordinate: [16.061307485294005, 108.23972422618492],
        },
        {
          device_id: '3',
          device_name: 'RAK Sticker 03',
          last_seen: '2021-01-01',
          battery: 100,
          status: 'active',
          coordinate: [16.061307485294005, 108.23972422618492],
        },
        {
          device_id: '4',
          device_name: 'RAK Sticker 04',
          last_seen: '2021-01-01',
          battery: 10,
          status: 'inactive',
          coordinate: [16.061307485294005, 108.23972422618492],
        },
      ],
      columns: [
        {
          column_name: 'Device Name',
          column_type: 'string',
          field: 'device_name',
        },
        {
          column_name: 'Battery',
          column_type: 'number',
          field: 'battery',
        },
        {
          column_name: 'Status',
          column_type: 'string',
          field: 'status',
        },
      ],
      conditions: [
        {
          field: 'battery',
          operator: OPERATORS.GreaterThan,
          value: 80,
          bg_color: 'DBECC0',
        },
        {
          field: 'active',
          operator: OPERATORS.NotEquals,
          value: 'active',
          bg_color: 'FAAFC6',
        },
      ],
      x: 0,
      y: 8,
      w: 6,
      h: 4,
      minW: 6,
      minH: 4,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '8',
      widget_info: {
        name: 'New Slider Widget',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Progress,
      value: 50,
      unit: 'ml',
      min: 0,
      color: '#F27877',
      max: 100,
      x: 0,
      y: 13,
      w: 6,
      h: 1,
      minW: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '9',
      widget_info: {
        name: 'Camera DMZ 01-1511-M01',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Camera,
      x: 0,
      y: 13,
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '10',
      widget_info: {
        name: 'Camera DMZ 01-1511-M02',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Camera,
      x: 3,
      y: 13,
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '2',
    configuration: {
      id: '11',
      type: WidgetType.Map,
      widget_info: {
        name: 'Current Location',
        appearance: {
          show_value: true,
        },
      },
      latitude: 16.05198423790203,
      longitude: 108.21679652348709,
      map_type: 'map',
      sources: [
        {
          device_id: '1',
          coordinate: [16.05198423790203, 108.21679652348709],
          map_type: MapType.RoadMap,
        },
      ],
      x: 0,
      y: 16,
      w: 6,
      h: 4,
      minW: 4,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '1',
      widget_info: {
        name: 'Camera DMZ 01-1511-M01',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Camera,
      x: 0,
      y: 0,
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '2',
      widget_info: {
        name: 'Camera DMZ 01-1511-M02',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Camera,
      x: 3,
      y: 0,
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '3',
      widget_info: {
        name: 'Camera DMZ 01-1511-M02',
        appearance: {
          show_value: true,
        },
      },
      type: WidgetType.Camera,
      x: 0,
      y: 4,
      w: 6,
      h: 3,
      minW: 3,
      minH: 3,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '4',
      type: WidgetType.Chart,
      widget_info: {
        name: 'Battery Usage Trend (RAK Sticker 01)',
        appearance: {
          show_value: true,
        },
      },
      axes: {
        y_axis: {
          unit: '',
          orientation: Orientation.Left,
        },
        hide_axis: false,
        is_show_grid: true,
        format: TimeFormat.TIME_24H,
      },
      timeframe: {
        aggregation_function: AggregationFunction.Average,
        from: dayjs().startOf('hour').toDate(),
        until: dayjs().endOf('hour').toDate(),
        type: TimeFrameTab.Hour,
      },
      sources: [
        {
          legend: 'Battery Usage',
          field: 'battery',
          show_legend: true,
          chart_type: ChartType.AreaChart,
          device_id: '1',
          color: '171717',
        },
      ],
      x: 0,
      y: 7,
      w: 6,
      h: 4,
      minW: 3,
      minH: 4,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '5',
      type: WidgetType.Sensor,
      widget_info: {
        name: 'Distance Travelled Today',
        appearance: {
          show_value: true,
        },
      },
      value: '50 km',
      color: '#151718',
      sensor_type: 'distance',
      x: 0,
      y: 11,
      w: 4,
      h: 1,
      minW: 3,
      minH: 1,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '6',
      type: WidgetType.Sensor,
      widget_info: {
        name: 'Current location',
        appearance: {
          show_value: true,
        },
      },
      value: "107°17' - 108°20'",
      color: '#151718',
      sensor_type: 'location',
      x: 0,
      y: 12,
      w: 4,
      h: 1,
      minW: 3,
      minH: 1,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '7',
      type: WidgetType.Gauge,
      widget_info: {
        name: 'Energy for DF ...',
        appearance: {
          show_value: true,
        },
      },
      source: {
        type: GaugeType.Circular,
        device_id: '1',
        field: 'battery',
        min: 0,
        max: 100,
        decimal: 0,
        values: [
          {
            color: '000',
            value: 0,
          },
          {
            value: 84,
            color: 'cecece',
          },
        ],
        unit: '%',
      },
      x: 5,
      y: 11,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '8',
      type: WidgetType.Unit,
      widget_info: {
        name: 'Current Speed',
        appearance: {
          show_value: true,
        },
      },
      value: 70,
      unit: 'km/h',
      status: 'On',
      x: 0,
      y: 13,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '9',
      type: WidgetType.Unit,
      widget_info: {
        name: 'Total Trip',
        appearance: {
          show_value: true,
        },
      },
      value: 12,
      unit: 'trips',
      x: 3,
      y: 13,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '10',
      type: WidgetType.Unit,
      widget_info: {
        name: 'Min. Speed of today',
        appearance: {
          show_value: true,
        },
      },
      value: 0,
      unit: 'km/h',
      x: 0,
      y: 15,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '11',
      type: WidgetType.Unit,
      widget_info: {
        name: 'AVG. Speed of today',
        appearance: {
          show_value: true,
        },
      },
      value: 84,
      unit: 'km/h',
      x: 2,
      y: 15,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '12',
      type: WidgetType.Unit,
      widget_info: {
        name: 'Max. Speed of today',
        appearance: {
          show_value: true,
        },
      },
      value: 125,
      unit: 'km/h',
      x: 4,
      y: 15,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
  },
  {
    id: uuidv4(),
    dashboard: '3',
    configuration: {
      id: '13',
      type: WidgetType.Map,
      widget_info: {
        name: 'Current Location',
        appearance: {
          show_value: true,
        },
      },
      sources: [
        {
          device_id: '1',
          coordinate: [16.05198423790203, 108.21679652348709],
          map_type: MapType.RoadMap,
        },
      ],
      x: 0,
      y: 17,
      w: 6,
      h: 4,
      minW: 3,
      minH: 2,
    },
  },
]
