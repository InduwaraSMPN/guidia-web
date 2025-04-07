export interface Event {
  eventID: number;
  title: string;
  eventDate: Date;
  imageURL: string;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDTO {
  title: string;
  eventDate: string;
  image: File;
}
