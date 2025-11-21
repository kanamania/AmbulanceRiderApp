import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DBTrip, DBTripType, DBUser, DatabaseInitResult } from '../types';
import { Trip, TripType, LocationPlace, User, Vehicle, VehicleType } from '../types';

// Database row interfaces
interface TripRow {
  id: number;
  name: string;
  description?: string;
  scheduledStartTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;
  rejectionReason?: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  fromLocationName: string;
  toLocationName: string;
  vehicleId?: number;
  driverId?: string;
  approvedBy?: string;
  approver?: string;
  approvedAt?: string;
  createdAt: string;
  tripTypeId?: number;
  attributeValues: string;
  optimizedRoute?: string;
  routePolyline?: string;
  estimatedDistance?: number;
  estimatedDuration?: number;
  isLocal: number | boolean;
  syncStatus: string;
}

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'ambulance_rider.db';
  private readonly DB_ENCRYPTED = false;
  private readonly DB_MODE = 'no-encryption';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Initialize the database and create tables
   */
  async initialize(): Promise<DatabaseInitResult> {
    try {
      // Check if platform is supported
      if (!Capacitor.isNativePlatform()) {
        console.log('Running on web platform, using localStorage fallback');
        return { success: true, message: 'Web platform detected' };
      }

      // Create or open the database
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = Array.isArray(ret.result) ? ret.result.length > 0 : ret.result;
      
      if (isConn) {
        await this.sqlite.closeConnection(this.DB_NAME, false);
      }

      this.db = await this.sqlite.createConnection(
        this.DB_NAME,
        this.DB_ENCRYPTED,
        this.DB_MODE,
        1,
        false
      );

      await this.db.open();
      await this.createTables();
      
      console.log('Database initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Database initialization failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create all necessary tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create trip_types table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS trip_types (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        icon TEXT,
        isActive INTEGER NOT NULL DEFAULT 1,
        displayOrder INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        attributes TEXT,
        UNIQUE(id)
      )
    `);

    // Create locations table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        longitude REAL NOT NULL,
        latitude REAL NOT NULL,
        imagePath TEXT,
        imageUrl TEXT,
        createdAt TEXT NOT NULL,
        UNIQUE(id)
      )
    `);

    // Create trips table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        scheduledStartTime TEXT,
        actualStartTime TEXT,
        actualEndTime TEXT,
        status TEXT NOT NULL,
        rejectionReason TEXT,
        fromLatitude REAL NOT NULL,
        fromLongitude REAL NOT NULL,
        toLatitude REAL NOT NULL,
        toLongitude REAL NOT NULL,
        fromLocationName TEXT,
        toLocationName TEXT,
        vehicleId INTEGER,
        driverId TEXT,
        approvedBy TEXT,
        approver TEXT,
        approvedAt TEXT,
        createdAt TEXT NOT NULL,
        tripTypeId INTEGER,
        attributeValues TEXT,
        optimizedRoute TEXT,
        routePolyline TEXT,
        estimatedDistance REAL,
        estimatedDuration REAL,
        isLocal INTEGER NOT NULL DEFAULT 0,
        syncStatus TEXT NOT NULL DEFAULT 'synced',
        lastSyncAttempt TEXT,
        syncError TEXT,
        UNIQUE(id)
      )
    `);

    // Create users table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        imagePath TEXT,
        imageUrl TEXT,
        roles TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        UNIQUE(id)
      )
    `);

    // Create vehicle_types table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS vehicle_types (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL,
        UNIQUE(id)
      )
    `);

    // Create vehicles table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        plateNumber TEXT,
        image TEXT,
        vehicleTypeId INTEGER,
        createdAt TEXT NOT NULL,
        UNIQUE(id)
      )
    `);

    // Create metadata table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        UNIQUE(key)
      )
    `);

    // Create indexes for better performance
    await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
      CREATE INDEX IF NOT EXISTS idx_trips_sync_status ON trips(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(createdAt);
      CREATE INDEX IF NOT EXISTS idx_trip_types_active ON trip_types(isActive);
      CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
      CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicleTypeId);
    `);
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  /**
   * Get database connection
   */
  getConnection(): SQLiteDBConnection | null {
    return this.db;
  }

  // Trip Types CRUD operations
  async upsertTripTypes(tripTypes: TripType[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const tripType of tripTypes) {
      const dbTripType: DBTripType = {
        ...tripType,
        attributes: JSON.stringify(tripType.attributes)
      };

      await this.db.query(`
        INSERT OR REPLACE INTO trip_types 
        (id, name, description, color, icon, isActive, displayOrder, createdAt, attributes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dbTripType.id,
        dbTripType.name,
        dbTripType.description,
        dbTripType.color,
        dbTripType.icon,
        dbTripType.isActive ? 1 : 0,
        dbTripType.displayOrder,
        dbTripType.createdAt,
        dbTripType.attributes
      ]);
    }
  }

  async getTripTypes(): Promise<TripType[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(`SELECT * FROM trip_types ORDER BY displayOrder`);
    
    interface TripTypeRow {
      id: number;
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      isActive: number | boolean;
      displayOrder: number;
      createdAt: string;
      attributes: string;
    }
    
    return result.values?.map((row: TripTypeRow) => ({
      ...row,
      isActive: Boolean(row.isActive),
      attributes: JSON.parse(row.attributes || '[]')
    })) || [];
  }

  // Locations CRUD operations
  async upsertLocations(locations: LocationPlace[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const location of locations) {
      await this.db.query(`
        INSERT OR REPLACE INTO locations 
        (id, name, longitude, latitude, imagePath, imageUrl, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        location.id,
        location.name,
        location.longitude,
        location.latitude,
        location.imagePath,
        location.imageUrl,
        location.createdAt
      ]);
    }
  }

  async getLocations(): Promise<LocationPlace[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(`SELECT * FROM locations ORDER BY name`);
    return result.values || [];
  }

  // Trips CRUD operations
  async upsertTrips(trips: Trip[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const trip of trips) {
      const dbTrip: DBTrip = {
        ...trip,
        attributeValues: JSON.stringify(trip.attributeValues) || undefined,
        isLocal: false,
        syncStatus: 'synced',
        approver: trip.approver ? trip.approver.id : undefined
      };

      await this.db.query(`
        INSERT OR REPLACE INTO trips 
        (id, name, description, scheduledStartTime, actualStartTime, actualEndTime, 
         status, rejectionReason, fromLatitude, fromLongitude, toLatitude, toLongitude,
         fromLocationName, toLocationName, vehicleId, driverId, approvedBy, approver,
         approvedAt, createdAt, tripTypeId, attributeValues, optimizedRoute, routePolyline,
         estimatedDistance, estimatedDuration, isLocal, syncStatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dbTrip.id,
        dbTrip.name,
        dbTrip.description,
        dbTrip.scheduledStartTime,
        dbTrip.actualStartTime,
        dbTrip.actualEndTime,
        dbTrip.status,
        dbTrip.rejectionReason,
        dbTrip.fromLatitude,
        dbTrip.fromLongitude,
        dbTrip.toLatitude,
        dbTrip.toLongitude,
        dbTrip.fromLocationName,
        dbTrip.toLocationName,
        dbTrip.vehicleId,
        dbTrip.driverId,
        dbTrip.approvedBy,
        dbTrip.approver,
        dbTrip.approvedAt,
        dbTrip.createdAt,
        dbTrip.tripTypeId,
        dbTrip.attributeValues,
        dbTrip.optimizedRoute,
        dbTrip.routePolyline,
        dbTrip.estimatedDistance,
        dbTrip.estimatedDuration,
        dbTrip.isLocal ? 1 : 0,
        dbTrip.syncStatus
      ]);
    }
  }

  async getTrips(): Promise<Trip[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(`
      SELECT * FROM trips 
      ORDER BY createdAt DESC
    `);
    
    return result.values?.map((row: TripRow): Trip => ({
      ...row,
      attributeValues: JSON.parse(row.attributeValues || '[]'),
      approver: row.approver ? { id: row.approver } : undefined
    })) || [];
  }

  async getPendingSyncTrips(): Promise<DBTrip[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(`
      SELECT * FROM trips 
      WHERE syncStatus = 'pending' OR syncStatus = 'error'
      ORDER BY createdAt DESC
    `);
    
    return result.values?.map((row: TripRow): DBTrip => ({
      ...row,
      attributeValues: JSON.parse(row.attributeValues || '[]'),
      isLocal: Boolean(row.isLocal),
      syncStatus: row.syncStatus as 'pending' | 'synced' | 'error'
    })) || [];
  }

  async updateTripSyncStatus(tripId: number, status: 'synced' | 'error', error?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.query(`
      UPDATE trips 
      SET syncStatus = ?, lastSyncAttempt = ?, syncError = ?
      WHERE id = ?
    `, [status, new Date().toISOString(), error || null, tripId]);
  }

  // Users CRUD operations
  async upsertUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const dbUser: DBUser = {
      ...user,
      roles: JSON.stringify(user.roles)
    };

    await this.db.query(`
      INSERT OR REPLACE INTO users 
      (id, firstName, lastName, email, phoneNumber, imagePath, imageUrl, roles, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      dbUser.id,
      dbUser.firstName,
      dbUser.lastName,
      dbUser.email,
      dbUser.phoneNumber,
      dbUser.imagePath,
      dbUser.imageUrl,
      dbUser.roles,
      dbUser.isActive ? 1 : 0,
      dbUser.createdAt
    ]);
  }

  async getUser(): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(`SELECT * FROM users LIMIT 1`);
    
    if (result.values && result.values.length > 0) {
      const row = result.values[0];
      return {
        ...row,
        roles: JSON.parse(row.roles || '[]'),
        isActive: Boolean(row.isActive)
      };
    }
    
    return null;
  }

  // Vehicles CRUD operations
  async upsertVehicles(vehicles: Vehicle[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const vehicle of vehicles) {
      await this.db.query(`
        INSERT OR REPLACE INTO vehicles 
        (id, name, plateNumber, image, vehicleTypeId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        vehicle.id,
        vehicle.name,
        vehicle.plateNumber,
        vehicle.image,
        vehicle.vehicleTypeId,
        vehicle.createdAt || new Date().toISOString()
      ]);
    }
  }

  async getVehicles(): Promise<Vehicle[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(`SELECT * FROM vehicles ORDER BY name`);
    return result.values || [];
  }

  // Vehicle Types CRUD operations
  async upsertVehicleTypes(vehicleTypes: VehicleType[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const vehicleType of vehicleTypes) {
      await this.db.query(`
        INSERT OR REPLACE INTO vehicle_types 
        (id, name, description, createdAt)
        VALUES (?, ?, ?, ?)
      `, [
        vehicleType.id,
        vehicleType.name,
        vehicleType.description,
        vehicleType.createdAt
      ]);
    }
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(`SELECT * FROM vehicle_types ORDER BY name`);
    return result.values || [];
  }

  /**
   * Clear all data (useful for logout)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execute(`DELETE FROM trips`);
    await this.db.execute(`DELETE FROM trip_types`);
    await this.db.execute(`DELETE FROM locations`);
    await this.db.execute(`DELETE FROM users`);
    await this.db.execute(`DELETE FROM vehicles`);
    await this.db.execute(`DELETE FROM vehicle_types`);
    await this.db.execute(`DELETE FROM metadata`);
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
