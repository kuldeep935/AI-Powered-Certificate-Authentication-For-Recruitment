// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateRegistry {
    struct Certificate {
        string certHash;
        string issuerName;
        string candidateName;
        string courseName;
        uint256 issueDate;
        bool isRevoked;
        address issuedBy;
    }

    mapping(string => Certificate) private certificates;
    mapping(address => bool) public authorizedIssuers;
    address public owner;

    event CertificateIssued(string indexed certHash, string candidateName, string issuerName);
    event CertificateRevoked(string indexed certHash);
    event IssuerAuthorized(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function issueCertificate(
        string memory certHash,
        string memory issuerName,
        string memory candidateName,
        string memory courseName
    ) external onlyIssuer {
        require(bytes(certificates[certHash].certHash).length == 0, "Already exists");
        certificates[certHash] = Certificate(
            certHash,
            issuerName,
            candidateName,
            courseName,
            block.timestamp,
            false,
            msg.sender
        );
        emit CertificateIssued(certHash, candidateName, issuerName);
    }

    function revokeCertificate(string memory certHash) external onlyIssuer {
        require(bytes(certificates[certHash].certHash).length != 0, "Not found");
        certificates[certHash].isRevoked = true;
        emit CertificateRevoked(certHash);
    }

    function verifyCertificate(
        string memory certHash
    )
        external
        view
        returns (
            bool exists,
            bool isRevoked,
            string memory issuerName,
            string memory candidateName,
            string memory courseName,
            uint256 issueDate
        )
    {
        Certificate memory cert = certificates[certHash];
        if (bytes(cert.certHash).length == 0) return (false, false, "", "", "", 0);
        return (
            true,
            cert.isRevoked,
            cert.issuerName,
            cert.candidateName,
            cert.courseName,
            cert.issueDate
        );
    }
}
