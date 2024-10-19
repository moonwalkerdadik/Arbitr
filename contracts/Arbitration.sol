// contracts/Arbitration.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Arbitration {
    struct Deal {
        address buyer;
        address seller;
        uint amount;
        bool isCompleted;
        bool isDisputed;
    }

    struct Dispute {
        uint dealId;
        address[] arbiters;
        mapping(address => bool) voted;
        uint votesForBuyer;
        uint votesForSeller;
    }

    mapping(uint => Deal) public deals;
    mapping(uint => Dispute) public disputes;
    uint public dealCount;
    uint public disputeCount;
    
    address[] public arbiters;  // Registered arbiters

    event DealCreated(uint dealId, address buyer, address seller, uint amount);
    event DisputeCreated(uint disputeId, uint dealId);
    event DisputeResolved(uint disputeId, address winner);

    function createDeal(address seller) external payable {
        require(msg.value > 0, "No funds sent");

        deals[dealCount] = Deal({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            isCompleted: false,
            isDisputed: false
        });

        emit DealCreated(dealCount, msg.sender, seller, msg.value);
        dealCount++;
    }

    function completeDeal(uint dealId) external {
        Deal storage deal = deals[dealId];
        require(msg.sender == deal.buyer, "Only buyer can complete the deal");
        require(!deal.isCompleted, "Deal already completed");
        
        deal.isCompleted = true;
        payable(deal.seller).transfer(deal.amount);
    }

    function createDispute(uint dealId) external {
        Deal storage deal = deals[dealId];
        require(msg.sender == deal.buyer || msg.sender == deal.seller, "Only involved parties can raise a dispute");
        require(!deal.isDisputed, "Dispute already created");

        disputes[disputeCount] = Dispute({
            dealId: dealId,
            arbiters: arbiters,
            votesForBuyer: 0,
            votesForSeller: 0
        });
        deal.isDisputed = true;

        emit DisputeCreated(disputeCount, dealId);
        disputeCount++;
    }

    function vote(uint disputeId, bool voteForBuyer) external {
        Dispute storage dispute = disputes[disputeId];
        require(!dispute.voted[msg.sender], "You have already voted");

        if (voteForBuyer) {
            dispute.votesForBuyer++;
        } else {
            dispute.votesForSeller++;
        }
        dispute.voted[msg.sender] = true;

        if (dispute.votesForBuyer > arbiters.length / 2 || dispute.votesForSeller > arbiters.length / 2) {
            resolveDispute(disputeId);
        }
    }

    function resolveDispute(uint disputeId) internal {
        Dispute storage dispute = disputes[disputeId];
        Deal storage deal = deals[dispute.dealId];
        
        if (dispute.votesForBuyer > dispute.votesForSeller) {
            payable(deal.buyer).transfer(deal.amount);
            emit DisputeResolved(disputeId, deal.buyer);
        } else {
            payable(deal.seller).transfer(deal.amount);
            emit DisputeResolved(disputeId, deal.seller);
        }

        deal.isCompleted = true;
    }

    function registerArbiter() external {
        arbiters.push(msg.sender);
    }
}
