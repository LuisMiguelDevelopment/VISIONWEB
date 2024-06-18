
CREATE DATABASE VISIONWEB


USE VISIONWEB


CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY,
    NameUser VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordKey VARCHAR(100) NOT NULL,
    DateBirth DATE,
    ProfilePicture VARCHAR(100),
    RecoveryToken VARCHAR(100),
    RecoveryTokenExpiry DATETIME
);

GO

CREATE TABLE Friends (
    FriendRequestId INT PRIMARY KEY IDENTITY,
    RequestingUserId INT NOT NULL,
    RequestedUserId INT NOT NULL,
    Status VARCHAR(10) CHECK (Status IN ('PENDING', 'ACCEPTED', 'REJECTED')) DEFAULT 'PENDING',
    FOREIGN KEY (RequestingUserId) REFERENCES Users(UserId),
    FOREIGN KEY (RequestedUserId) REFERENCES Users(UserId)
);


GO



CREATE TABLE FriendsList (
    UserId1 INT NOT NULL,
    UserId2 INT NOT NULL,
    FOREIGN KEY (UserId1) REFERENCES Users(UserId),
    FOREIGN KEY (UserId2) REFERENCES Users(UserId),
    PRIMARY KEY (UserId1, UserId2)  -- Ensure a unique pair of friends
);


GO



CREATE TABLE ConnectedUsers (
    UserId INT PRIMARY KEY,
    SocketId VARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

GO


CREATE TABLE CallHistory (
    CallId INT PRIMARY KEY IDENTITY,
    StartDateTime DATETIME NOT NULL,
    EndDateTime DATETIME,
    Active BIT NOT NULL DEFAULT 1 
);


GO

CREATE TABLE CallParticipants (
    CallId INT,
    UserId INT,
    IsActiveParticipant BIT NOT NULL DEFAULT 0,  
    PRIMARY KEY (CallId, UserId),
    FOREIGN KEY (CallId) REFERENCES CallHistory(CallId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);






